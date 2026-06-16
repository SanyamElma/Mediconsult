/** Right-aligned user chat bubble. */
export default function UserMessage({ text }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[85%] rounded-2xl rounded-br-md bg-gradient-to-r from-brand-600 to-brand-500 px-3.5 py-2 text-sm text-white shadow-sm">
        {text}
      </div>
    </div>
  );
}
