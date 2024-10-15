export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="px-6">{children}</div>;
}
