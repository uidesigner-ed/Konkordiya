"use client";

/** Список, що одразу відправляє форму при зміні (статус заявки, роль користувача) */
export function StatusSelect({
  name,
  value,
  options,
  label = "Статус",
  disabled,
}: {
  name: string;
  value: string;
  options: { id: string; label: string }[];
  label?: string;
  disabled?: boolean;
}) {
  return (
    <select
      // Після серверної дії React скидає форму до початкового defaultValue — без key список
      // візуально повертався до старого значення; key перестворює його з новим значенням із сервера
      key={value}
      name={name}
      defaultValue={value}
      aria-label={label}
      disabled={disabled}
      className="adm-select-sm"
      onChange={(e) => e.currentTarget.form?.requestSubmit()}
    >
      {options.map((o) => (
        <option key={o.id} value={o.id}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
