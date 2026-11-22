import { RenderRoute, staticPaths, pathFrom, routeMetadata, type RouteProps } from '../../routes';
export const dynamicParams = false;
export const generateStaticParams = staticPaths;
export async function generateMetadata({params}:RouteProps) { return {...routeMetadata("id",pathFrom((await params).path))}; }
export default async function Page({params}:RouteProps) { return <RenderRoute locale="id" path={pathFrom((await params).path)} />; }
