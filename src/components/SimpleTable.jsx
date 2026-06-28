function SimpleTable({ columns, rows, emptyMessage = 'No hay datos para mostrar.' }) {
  const colSpan = Math.max(columns.length, 1)

  return (
    <div className="table-wrapper">
      <table className="simple-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key || column.accessor}>{column.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td className="table-empty-cell" colSpan={colSpan}>
                <strong>{emptyMessage}</strong>
                <span>Cuando haya información disponible, aparecerá en esta tabla.</span>
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.id}>
                {columns.map((column) => (
                  <td key={column.key || column.accessor}>
                    {column.render ? column.render(row) : row[column.accessor]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

export default SimpleTable
