export default async function TestPage() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_DRUPAL_BASE_URL}/jsonapi`, {
    cache: 'no-store',
  });
  const data = await res.json();

  return (
    <div>
      <h1>Drupal JSON:API Index</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}