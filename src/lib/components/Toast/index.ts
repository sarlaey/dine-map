import ToasterComponent from './Toaster.svelte';
import Toast from './Toast.svelte';
import { Toaster as ToastManager } from './toast';

const Toaster = ToastManager as typeof ToastManager & {
	Toast: typeof Toast;
	Toaster: typeof ToasterComponent;
};
Toaster.Toast = Toast;
Toaster.Toaster = ToasterComponent;

export default Toaster;
