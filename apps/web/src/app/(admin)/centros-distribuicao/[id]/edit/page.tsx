import { CentrosDistribuicaoEditPage } from '../../../../../resources/centros-distribuicao/pages/centros-distribuicao-edit-page';

interface EditCentroDistribuicaoPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditCentroDistribuicaoPage({
  params,
}: EditCentroDistribuicaoPageProps): Promise<React.JSX.Element> {
  const { id } = await params;
  return <CentrosDistribuicaoEditPage id={id} />;
}
