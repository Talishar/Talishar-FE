/**
 * VPN Detection and handling utilities
 * Helps identify and provide guidance when VPN providers block connections
 */

interface VpnBlockInfo {
  isBlocked: boolean;
  provider: string;
  header: string;
  solution: string;
}

/**
 * Detect if a response was blocked by a VPN provider
 */
export const detectVpnBlock = (headers: Headers | Record<string, string>): VpnBlockInfo | null => {
  // Check NordVPN blocks
  const nordSecHeader = headers instanceof Headers 
    ? headers.get('x-nord-sec')
    : headers['x-nord-sec'];
  
  if (nordSecHeader === 'blocked') {
    return {
      isBlocked: true,
      provider: 'NordVPN',
      header: 'x-nord-sec: blocked',
      solution: 'Whitelist talishar.net in your NordVPN settings, or temporarily disable the VPN'
    };
  }

  // Add other VPN providers as needed
  // ExpressVPN uses X-ExpressVPN-Block, Surfshark uses X-Surfshark-Block, etc.

  return null;
};

/**
 * Log VPN block for diagnostics
 */
export const logVpnBlock = (vpnInfo: VpnBlockInfo): void => {
  console.warn(`🔒 VPN Provider Block Detected`, {
    provider: vpnInfo.provider,
    header: vpnInfo.header,
    solution: vpnInfo.solution,
    timestamp: new Date().toISOString()
  });
};

/**
 * Get user-friendly message about VPN blocks
 */
export const getVpnBlockMessage = (vpnInfo: VpnBlockInfo): string => {
  return `Your ${vpnInfo.provider} VPN is blocking our game servers. ${vpnInfo.solution}`;
};
