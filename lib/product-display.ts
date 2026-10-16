/** Removes internal demo suffixes from titles shown to shoppers; demo status is disclosed on the shop page. */
export function displayProductName(name: string): string {
  return name.replace(/\s*\(TEST\)\s*$/i, '').trim();
}
