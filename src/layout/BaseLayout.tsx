export default function Layout({ children }: { children: React.ReactNode }) {
	return (
		<>
			{/* <SidebarProvider open={false}>
      <AppSidebar />
      <SidebarTrigger /> */}
			{children}
			{/* </SidebarProvider> */}
		</>
	);
}
