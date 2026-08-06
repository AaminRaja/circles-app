export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      {Icon && (
        <div className="w-14 h-14 rounded-full bg-secondary-light flex items-center justify-center mb-4">
          <Icon size={26} className="text-secondary" />
        </div>
      )}
      <h3 className="font-display font-semibold text-lg mb-1">{title}</h3>
      {description && <p className="text-text-muted text-sm max-w-sm mb-4">{description}</p>}
      {action}
    </div>
  );
}
