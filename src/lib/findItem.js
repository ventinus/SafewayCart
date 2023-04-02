export const findItem = (inventory, { name }) => {
  const lowerName = name.toLowerCase();
  return inventory.find((item) => {
    return (
      item.name.toLowerCase().includes(lowerName) ||
      item.shelfName.toLowerCase().includes(lowerName)
    );
  });
};
