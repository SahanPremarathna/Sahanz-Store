async function getProducts() {
  return [
    { id: "prod-1", name: "Rice Bag", price: 2400 },
    { id: "prod-2", name: "Tea Pack", price: 850 }
  ];
}

module.exports = {
  getProducts
};
