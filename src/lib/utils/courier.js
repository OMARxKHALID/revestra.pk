export const courierTrackingUrl = (couriers, courier, number) => {
  if (!courier || !number) return null;

  const match = (couriers ?? []).find(
    ({ name }) => name.trim().toLowerCase() === courier.trim().toLowerCase()
  );

  if (!match?.trackingUrl) return null;

  const encoded = encodeURIComponent(number.trim());

  return match.trackingUrl.includes("{number}")
    ? match.trackingUrl.replaceAll("{number}", encoded)
    : `${match.trackingUrl}${encoded}`;
};
