export const handleAddToCart = (setCartMessages) => {
  const messageId = `${Date.now()}-${Math.random()}`;

  setCartMessages((messages) => [...messages, { id: messageId }]);

  setTimeout(() => {
    setCartMessages((messages) => messages.filter((message) => message.id !== messageId));
  }, 4500);
};
