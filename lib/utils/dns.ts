export const checkDNS = async (hostname: string) => {
  try {
    const response = await fetch(`https://${hostname}`, { 
      method: 'HEAD',
      mode: 'no-cors'
    });
    return true;
  } catch (error) {
    console.error('DNS check failed:', error);
    return false;
  }
}; 