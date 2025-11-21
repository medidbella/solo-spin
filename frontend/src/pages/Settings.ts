export function renderSettings(): string {
  return `
    <div class="text-center bg-white p-6 rounded-lg shadow-md">
      <h1 class="text-3xl font-bold text-blue-600 mb-4">Settings Page</h1>
      <p class="text-lg text-gray-700">Adjust settings here.</p>
      <form class="mt-4 space-y-4">
        <label class="block text-left">Choose Theme:</label>
        <select class="w-full border border-gray-300 p-2 rounded">
          <option>Light</option>
          <option>Dark</option>
        </select>
        <button type="submit" class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">Save</button>
      </form>
    </div>
  `;
}