export const handleAddToCart = (setCartMessage) => {
  setCartMessage(true);

  setTimeout(() => {
    setCartMessage(false);
  }, 2000);
};
