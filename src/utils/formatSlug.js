export function formatSlug(str) {
  if (!str) return '';
  const replaced = str.replace(/-/g, ' ');
  return replaced.charAt(0).toUpperCase() + replaced.slice(1);
}
