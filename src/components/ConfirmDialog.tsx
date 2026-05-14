import React from "react";

interface ConfirmDialogProps {
	isOpen: boolean;
	title: string;
	message: string;
	confirmLabel?: string;
	cancelLabel?: string;
	variant?: "danger" | "warning" | "info";
	onConfirm: () => void;
	onCancel: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
	isOpen,
	title,
	message,
	confirmLabel = "Confirm",
	cancelLabel = "Cancel",
	variant = "danger",
	onConfirm,
	onCancel,
}) => {
	if (!isOpen) return null;

	const variantStyles = {
		danger: {
			icon: (
				<div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
					<svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
					</svg>
				</div>
			),
			button: "btn-danger",
		},
		warning: {
			icon: (
				<div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-4">
					<svg className="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
					</svg>
				</div>
			),
			button: "bg-amber-500 hover:bg-amber-600 text-white font-medium px-5 py-2.5 rounded-xl transition-all duration-200",
		},
		info: {
			icon: (
				<div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-4">
					<svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
				</div>
			),
			button: "btn-primary",
		},
	};

	const styles = variantStyles[variant];

	return (
		<div className="fixed inset-0 z-99999 flex items-center justify-center p-4" onClick={onCancel}>
			{/* Backdrop */}
			<div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in" />
			
			{/* Dialog */}
			<div
				className="relative glass-card max-w-sm w-full p-6 text-center animate-scale-in"
				onClick={(e) => e.stopPropagation()}
			>
				{styles.icon}
				<h3 className="text-lg font-semibold text-black dark:text-white mb-2">
					{title}
				</h3>
				<p className="text-sm text-body dark:text-bodydark mb-6">
					{message}
				</p>
				<div className="flex gap-3 justify-center">
					<button
						onClick={onCancel}
						className="btn-secondary text-sm"
					>
						{cancelLabel}
					</button>
					<button
						onClick={onConfirm}
						className={`${styles.button} text-sm`}
					>
						{confirmLabel}
					</button>
				</div>
			</div>
		</div>
	);
};

export default ConfirmDialog;
