function TableArea({ total, cols }) {
	const	cards = Array.from({ length:total })

	return (
		<div className="table-area">
			<div className="river-display">{total / cols} X {cols}</div>
			<div
				className="river"
				style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
			>
				{cards.map((_,i) => (
					<div key={i} className="card card-back" />
				))}
			</div>
		</div>
	)
}

export default TableArea
