export const findItem = (inventory, { name }) => {
  const lowerName = name.toLowerCase();
  return inventory.find((item) => {
    return (
      item.name.toLowerCase().includes(lowerName) ||
      item.shelfName.toLowerCase().includes(lowerName)
    );
  });
};

export const parseCookies = (response) =>
  response.headers
    .raw()
    ["set-cookie"].map((entry) => {
      const parts = entry.split(";");
      return parts[0];
    })
    .join(";");
