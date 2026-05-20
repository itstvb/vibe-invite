export default function DashboardPage() {
  return (
    <main style={{ padding: '2rem' }}>
      <h1>Dashboard</h1>
      <p>
        Auth-protected invitation lists, RSVP counts, and analytics belong here. Reads can use owner-scoped
        Firestore client queries, while sensitive writes stay behind API routes.
      </p>
    </main>
  );
}
