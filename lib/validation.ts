const ETH_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export function isValidEthAddress(address: string): boolean {
  return ETH_ADDRESS_REGEX.test(address);
}

export function isValidDateString(date: string): boolean {
  if (!DATE_REGEX.test(date)) return false;
  const parsed = new Date(`${date}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime());
}
