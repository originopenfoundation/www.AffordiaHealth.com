import { RenderRoute, staticPaths, pathFrom, routeMetadata, type RouteProps } from '../../routes';
export const dynamicParams = false;
export const generateStaticParams = staticPaths;
export async function generateMetadata({ params }: RouteProps) { return routeMetadata('en', pathFrom((await params).path)); }
export default async function Page({ params }: RouteProps) { return <RenderRoute locale="en" path={pathFrom((await params).path)} />; }
