export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, background: "#05050A" }}>
        {children}
      </body>
    </html>
  );
}
