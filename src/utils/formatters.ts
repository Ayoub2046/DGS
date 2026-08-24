export function formatCurrency(amount: number, symbol = '$', currencyCode = 'USD'): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return `${symbol}0.00`;
  }
  return `${symbol}${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatDozens(dozens: number): string {
  if (isNaN(dozens) || dozens === null || dozens === undefined) return '0 doz';
  // format clean decimal: if integer show as int, if decimal show up to 2 decimal places
  const formatted = Number.isInteger(dozens) ? dozens.toString() : dozens.toFixed(2).replace(/\.?0+$/, '');
  return `${formatted} doz`;
}

export function formatPairs(pairs: number): string {
  if (isNaN(pairs) || pairs === null || pairs === undefined) return '0 pairs';
  return `${Math.round(pairs).toLocaleString()} pairs`;
}

export function formatDozensAndPairs(pairs: number): string {
  const dozens = pairs / 12;
  const dozFormatted = Number.isInteger(dozens) ? dozens.toString() : dozens.toFixed(2).replace(/\.?0+$/, '');
  return `${dozFormatted} doz (${pairs} pairs)`;
}

export function formatDate(isoString: string): string {
  if (!isoString) return '';
  const d = new Date(isoString);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(isoString: string): string {
  if (!isoString) return '';
  const d = new Date(isoString);
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatTime(isoString: string): string {
  if (!isoString) return '';
  const d = new Date(isoString);
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getRelativeTime(isoString: string): string {
  if (!isoString) return '';
  const diffMs = Date.now() - new Date(isoString).getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 30) return `${diffDays}d ago`;
  return formatDate(isoString);
}

export function getCancellationRemainingMs(orderDateIso: string): number {
  const orderTime = new Date(orderDateIso).getTime();
  const deadline = orderTime + 24 * 60 * 60 * 1000;
  return deadline - Date.now();
}

export function isOrderWithin24Hours(orderDateIso: string): boolean {
  return getCancellationRemainingMs(orderDateIso) > 0;
}

export function formatRemainingTime(ms: number): string {
  if (ms <= 0) return 'Expired';
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m left`;
}
