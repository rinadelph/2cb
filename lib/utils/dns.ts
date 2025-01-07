export async function checkDNS(domain: string): Promise<boolean> {
  try {
    const result = await fetch(`https://dns.google/resolve?name=${domain}`);
    const data = await result.json();
    return data.Status === 0; // 0 means success in DNS response
  } catch (error) {
    console.error('DNS check failed:', error);
    return false;
  }
} 