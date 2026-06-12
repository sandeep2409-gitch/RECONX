/**
 * ReconX Passive Recon APIs
 * Using local server-side proxy route to fetch data passively and bypass CORS natively.
 */

// Helper to clean domain inputs
export function cleanDomain(input) {
  if (!input) return '';
  let cleaned = input.trim().toLowerCase();
  // Strip protocol
  cleaned = cleaned.replace(/^(https?:\/\/)?(www\.)?/, '');
  // Strip paths or queries
  cleaned = cleaned.split('/')[0];
  // Strip port numbers
  cleaned = cleaned.split(':')[0];
  return cleaned;
}

// Fetch helper routing through our Next.js server proxy
async function fetchWithProxy(url, options = {}) {
  // Append mode=headers if we only want response headers
  const isHeaderMode = options.headersMode ? '&mode=headers' : '';
  const proxyUrl = `/api/proxy?url=${encodeURIComponent(url)}${isHeaderMode}`;

  try {
    const response = await fetch(proxyUrl);
    if (!response.ok) {
      throw new Error(`Proxy lookup failed with status: ${response.status}`);
    }

    if (options.headersMode) {
      // In headersMode, our proxy returns a JSON matching the Allorigins schema
      const wrapper = await response.json();
      return {
        data: wrapper.contents,
        headers: wrapper.status?.headers || {},
        rawWrapper: wrapper
      };
    } else {
      // In direct mode, our proxy returns the text or JSON directly
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const json = await response.json();
        return {
          data: typeof json === 'string' ? json : JSON.stringify(json),
          rawJson: json
        };
      } else {
        const text = await response.text();
        return {
          data: text,
          rawJson: null
        };
      }
    }
  } catch (error) {
    console.error(`Error querying target through Next.js proxy:`, error);
    throw error;
  }
}

/**
 * 1. Fetch WHOIS / RDAP Data
 */
export async function fetchWhoisData(domain, logCallback) {
  logCallback(`[INFO] Querying RDAP bootstrap for: ${domain}`);
  try {
    const targetUrl = `https://rdap.org/domain/${domain}`;
    const result = await fetchWithProxy(targetUrl);
    
    let parsed = {};
    if (result.rawJson) {
      parsed = result.rawJson;
    } else {
      try {
        parsed = JSON.parse(result.data);
      } catch {
        logCallback(`[WARN] RDAP did not return valid JSON. Attempting WHOIS parsing fallback.`);
        return parseTextWhois(result.data);
      }
    }

    logCallback(`[SUCCESS] RDAP data parsed successfully.`);
    
    // Extract info from RDAP schema
    const registrarEntity = parsed.entities?.find(e => e.roles?.includes('registrar'));
    const registrarName = registrarEntity?.vcardArray?.[1]?.find(v => v[0] === 'fn')?.[3] || 'Unknown Registrar';
    
    // Extract events
    const events = parsed.events || [];
    const createdEvent = events.find(e => e.eventAction === 'registration');
    const expiryEvent = events.find(e => e.eventAction === 'expiration');
    const updatedEvent = events.find(e => e.eventAction === 'last changed');

    // Extract nameservers
    const nameservers = parsed.nameservers?.map(ns => ns.ldhName) || [];

    return {
      registrar: registrarName || 'N/A',
      created: createdEvent ? new Date(createdEvent.eventDate).toLocaleDateString() : 'N/A',
      expires: expiryEvent ? new Date(expiryEvent.eventDate).toLocaleDateString() : 'N/A',
      updated: updatedEvent ? new Date(updatedEvent.eventDate).toLocaleDateString() : 'N/A',
      nameservers: nameservers.length > 0 ? nameservers : ['N/A'],
      raw: JSON.stringify(parsed, null, 2)
    };
  } catch (err) {
    logCallback(`[ERROR] WHOIS/RDAP query failed: ${err.message}`);
    return {
      registrar: 'Query Failed',
      created: 'N/A',
      expires: 'N/A',
      updated: 'N/A',
      nameservers: ['N/A'],
      raw: `Query Failed: ${err.message}`
    };
  }
}

function parseTextWhois(text) {
  if (!text) return { registrar: 'N/A', created: 'N/A', expires: 'N/A', updated: 'N/A', nameservers: ['N/A'], raw: '' };
  
  const registrarMatch = text.match(/Registrar:\s*(.*)/i) || text.match(/Registrar Name:\s*(.*)/i);
  const createdMatch = text.match(/Creation Date:\s*(.*)/i) || text.match(/Created On:\s*(.*)/i);
  const expiresMatch = text.match(/Registry Expiry Date:\s*(.*)/i) || text.match(/Expiration Date:\s*(.*)/i);
  const updatedMatch = text.match(/Updated Date:\s*(.*)/i) || text.match(/Last Updated On:\s*(.*)/i);
  
  const nsMatches = [...text.matchAll(/Name Server:\s*([^\s\r\n]+)/gi)].map(m => m[1]);

  return {
    registrar: registrarMatch ? registrarMatch[1].trim() : 'N/A',
    created: createdMatch ? new Date(createdMatch[1].trim()).toLocaleDateString() : 'N/A',
    expires: expiresMatch ? new Date(expiresMatch[1].trim()).toLocaleDateString() : 'N/A',
    updated: updatedMatch ? new Date(updatedMatch[1].trim()).toLocaleDateString() : 'N/A',
    nameservers: nsMatches.length > 0 ? nsMatches : ['N/A'],
    raw: text
  };
}

/**
 * 2. Fetch DNS Records via Google DNS API
 */
export async function fetchDnsRecords(domain, logCallback) {
  const recordTypes = ['A', 'AAAA', 'MX', 'TXT', 'CNAME', 'NS', 'SOA'];
  const results = {};
  
  logCallback(`[INFO] Querying Google DNS Resolver for records.`);
  
  for (const type of recordTypes) {
    try {
      const response = await fetch(`https://dns.google/resolve?name=${domain}&type=${type}`);
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      const data = await response.json();
      
      if (data.Answer && data.Answer.length > 0) {
        results[type] = data.Answer.map(record => ({
          name: record.name,
          ttl: record.TTL,
          data: record.data
        }));
        logCallback(`[SUCCESS] Retrieved ${data.Answer.length} ${type} record(s).`);
      } else {
        results[type] = [];
      }
    } catch (err) {
      logCallback(`[WARN] Failed to query ${type} records: ${err.message}`);
      results[type] = [];
    }
  }
  
  return results;
}

/**
 * 3. Fetch SSL Certificate Details
 */
export async function fetchSslDetails(domain, logCallback) {
  logCallback(`[INFO] Accessing crt.sh Certificate Transparency Logs for: ${domain}`);
  try {
    const targetUrl = `https://crt.sh/?q=${domain}&output=json`;
    const result = await fetchWithProxy(targetUrl);
    
    let logs = [];
    if (result.rawJson) {
      logs = result.rawJson;
    } else {
      try {
        logs = JSON.parse(result.data);
      } catch {
        throw new Error("Invalid JSON response from crt.sh");
      }
    }

    if (!Array.isArray(logs) || logs.length === 0) {
      logCallback(`[WARN] No SSL logs found on crt.sh for domain.`);
      return {
        issuer: 'N/A',
        validFrom: 'N/A',
        validTo: 'N/A',
        sans: [],
        status: 'No certificate logs found'
      };
    }

    const latest = logs[0];
    const sans = Array.from(new Set(logs.flatMap(log => log.name_value.split('\n'))));

    logCallback(`[SUCCESS] SSL log retrieval complete. Active cert issuer: ${latest.issuer_name}`);

    const expiryDate = latest.not_after ? new Date(latest.not_after) : null;
    const now = new Date();
    let status = 'Valid';
    if (expiryDate && expiryDate < now) {
      status = 'Expired';
    }

    return {
      issuer: latest.issuer_name || 'Unknown Issuer',
      validFrom: latest.not_before ? new Date(latest.not_before).toLocaleDateString() : 'N/A',
      validTo: latest.not_after ? new Date(latest.not_after).toLocaleDateString() : 'N/A',
      sans: sans.filter(name => name !== domain),
      status: status
    };
  } catch (err) {
    logCallback(`[ERROR] SSL certificate query failed: ${err.message}`);
    return {
      issuer: 'Failed to retrieve',
      validFrom: 'N/A',
      validTo: 'N/A',
      sans: [],
      status: 'Error'
    };
  }
}

/**
 * 4. Subdomain Enumeration via crt.sh
 */
export async function fetchSubdomains(domain, logCallback) {
  logCallback(`[INFO] Starting subdomain discovery via Certificate Transparency logs.`);
  try {
    const targetUrl = `https://crt.sh/?q=%.${domain}&output=json`;
    const result = await fetchWithProxy(targetUrl);
    
    let logs = [];
    if (result.rawJson) {
      logs = result.rawJson;
    } else {
      try {
        logs = JSON.parse(result.data);
      } catch {
        throw new Error("Invalid JSON response from crt.sh");
      }
    }

    if (!Array.isArray(logs) || logs.length === 0) {
      logCallback(`[SUCCESS] Subdomain enumeration finished. 0 subdomains found.`);
      return [];
    }

    const subdomainSet = new Set();
    logs.forEach(item => {
      if (item.name_value) {
        const names = item.name_value.split('\n');
        names.forEach(name => {
          const cleaned = name.trim().toLowerCase();
          if (cleaned.endsWith(domain) && !cleaned.includes('*')) {
            subdomainSet.add(cleaned);
          }
        });
      }
    });

    const subdomains = Array.from(subdomainSet).sort();
    logCallback(`[SUCCESS] Subdomain discovery complete. Found ${subdomains.length} unique subdomains.`);
    return subdomains;
  } catch (err) {
    logCallback(`[ERROR] Subdomain discovery failed: ${err.message}`);
    return [];
  }
}

/**
 * 5. Fetch IP & ASN Intelligence
 */
export async function fetchIpAndAsn(domain, logCallback) {
  logCallback(`[INFO] Looking up A record IP for ASN intelligence.`);
  try {
    const dnsResponse = await fetch(`https://dns.google/resolve?name=${domain}&type=A`);
    if (!dnsResponse.ok) throw new Error('Failed to resolve A record');
    const dnsData = await dnsResponse.json();
    
    const aRecord = dnsData.Answer?.find(rec => rec.type === 1);
    if (!aRecord) {
      logCallback(`[WARN] No A record found for domain. Using fallbacks.`);
      return {
        ip: 'N/A',
        org: 'N/A',
        country: 'N/A',
        city: 'N/A',
        postal: 'N/A',
        loc: 'N/A',
        timezone: 'N/A',
        asn: 'N/A'
      };
    }

    const ip = aRecord.data;
    logCallback(`[INFO] Resolved domain to IP: ${ip}. Fetching IP intelligence.`);

    const ipResponse = await fetch(`https://ipapi.co/${ip}/json/`);
    if (!ipResponse.ok) throw new Error('ipapi.co query failed');
    const ipData = await ipResponse.json();

    logCallback(`[SUCCESS] IP Intelligence fetched. ASN: ${ipData.asn || 'N/A'}, Organization: ${ipData.org || 'N/A'}`);

    return {
      ip: ipData.ip || ip,
      org: ipData.org || 'N/A',
      country: ipData.country_name || 'N/A',
      countryCode: ipData.country_code || '',
      city: ipData.city || 'N/A',
      postal: ipData.postal || 'N/A',
      loc: `${ipData.latitude}, ${ipData.longitude}` || 'N/A',
      timezone: ipData.timezone || 'N/A',
      asn: ipData.asn || 'N/A'
    };
  } catch (err) {
    logCallback(`[ERROR] IP Intelligence lookup failed: ${err.message}`);
    return {
      ip: 'Failed to look up',
      org: 'N/A',
      country: 'N/A',
      city: 'N/A',
      postal: 'N/A',
      loc: 'N/A',
      timezone: 'N/A',
      asn: 'N/A'
    };
  }
}

/**
 * 6. Passive Security Headers Audit
 */
export async function auditSecurityHeaders(domain, logCallback) {
  logCallback(`[INFO] Auditing HTTP security headers via local server proxy.`);
  try {
    const targetUrl = `https://${domain}`;
    const result = await fetchWithProxy(targetUrl, { headersMode: true });
    
    const rawHeaders = result.headers || {};
    const headers = {};
    Object.keys(rawHeaders).forEach(key => {
      headers[key.toLowerCase()] = rawHeaders[key];
    });

    logCallback(`[SUCCESS] HTTP response headers retrieved successfully.`);

    const audit = {
      'Strict-Transport-Security': {
        name: 'HSTS (Strict-Transport-Security)',
        value: headers['strict-transport-security'] || null,
        status: headers['strict-transport-security'] ? 'PASS' : 'FAIL',
        desc: 'Enforces secure HTTPS connections.',
        severity: 'HIGH'
      },
      'Content-Security-Policy': {
        name: 'CSP (Content-Security-Policy)',
        value: headers['content-security-policy'] || null,
        status: headers['content-security-policy'] ? 'PASS' : 'FAIL',
        desc: 'Prevents XSS and injection attacks.',
        severity: 'HIGH'
      },
      'X-Frame-Options': {
        name: 'X-Frame-Options',
        value: headers['x-frame-options'] || null,
        status: headers['x-frame-options'] ? 'PASS' : 'FAIL',
        desc: 'Protects against Clickjacking.',
        severity: 'MEDIUM'
      },
      'X-Content-Type-Options': {
        name: 'X-Content-Type-Options',
        value: headers['x-content-type-options'] || null,
        status: headers['x-content-type-options'] ? 'PASS' : 'FAIL',
        desc: 'Blocks MIME-type sniffing.',
        severity: 'LOW'
      },
      'Referrer-Policy': {
        name: 'Referrer-Policy',
        value: headers['referrer-policy'] || null,
        status: headers['referrer-policy'] ? 'PASS' : 'FAIL',
        desc: 'Controls how much referrer information is shared.',
        severity: 'LOW'
      },
      'Permissions-Policy': {
        name: 'Permissions-Policy',
        value: headers['permissions-policy'] || headers['feature-policy'] || null,
        status: (headers['permissions-policy'] || headers['feature-policy']) ? 'PASS' : 'FAIL',
        desc: 'Restricts access to browser features (e.g. camera, geolocation).',
        severity: 'LOW'
      }
    };

    return {
      audit,
      rawHeaders: JSON.stringify(rawHeaders, null, 2)
    };
  } catch (err) {
    logCallback(`[ERROR] Security headers audit failed: ${err.message}`);
    
    const audit = {
      'Strict-Transport-Security': { name: 'HSTS (Strict-Transport-Security)', value: null, status: 'UNKNOWN', desc: 'Enforces secure HTTPS connections.', severity: 'HIGH' },
      'Content-Security-Policy': { name: 'CSP (Content-Security-Policy)', value: null, status: 'UNKNOWN', desc: 'Prevents XSS and injection attacks.', severity: 'HIGH' },
      'X-Frame-Options': { name: 'X-Frame-Options', value: null, status: 'UNKNOWN', desc: 'Protects against Clickjacking.', severity: 'MEDIUM' },
      'X-Content-Type-Options': { name: 'X-Content-Type-Options', value: null, status: 'UNKNOWN', desc: 'Blocks MIME-type sniffing.', severity: 'LOW' },
      'Referrer-Policy': { name: 'Referrer-Policy', value: null, status: 'UNKNOWN', desc: 'Controls how much referrer info is shared.', severity: 'LOW' },
      'Permissions-Policy': { name: 'Permissions-Policy', value: null, status: 'UNKNOWN', desc: 'Restricts access to browser features.', severity: 'LOW' }
    };

    return {
      audit,
      rawHeaders: `Headers lookup failed: ${err.message}`
    };
  }
}
