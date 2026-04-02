import { TransportadorasEditPage } from '../../../../../resources/transportadoras/pages/transportadoras-edit-page';

interface EditTransportadoraPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditTransportadoraPage({
  params,
}: EditTransportadoraPageProps): Promise<React.JSX.Element> {
  const { id } = await params;
  return <TransportadorasEditPage id={id} />;
}
