import { UserDetailView } from "@/components/dashboard/user-detail-view";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function UserDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <UserDetailView userId={id} />;
}