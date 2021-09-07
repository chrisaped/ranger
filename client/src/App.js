export default function App() {
  async function callExpress() {
    const response = await fetch('/express_backend')
    console.log('here is the response', response)
  }

  return (
    <div>
      <button onClick={callExpress}>Submit</button>
    </div>
  );
}
