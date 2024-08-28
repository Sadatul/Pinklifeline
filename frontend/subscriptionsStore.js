// subscriptionsStore.js
let subscriptions = [];

export function addSubscription(subscription) {
  subscriptions.push(subscription);
}

export function getSubscriptions() {
  return subscriptions;
}
