import { Component } from '@angular/core';
import html2canvas from 'html2canvas';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { LoadingController, Platform } from '@ionic/angular';

@Component({
	selector: 'app-home',
	templateUrl: 'home.page.html',
	styleUrls: ['home.page.scss'],
})
export class HomePage {
	segment = 'generate';
	qrText = '';

	constructor(
		private loadingController: LoadingController,
		private platform: Platform
	) {}

	// === Captura el elemento html, convierte a canvas y obtiene una imagen ===
	captureScreen() {
		const element = document.getElementById('qrImage') as HTMLElement;
		html2canvas(element).then((canvas: HTMLCanvasElement) => {

			if (this.platform.is('capacitor')) this.ShareImage(canvas)
			else this.downloadImage(canvas);

		});
	}

	// === Descarga la imagen (web) ===
	downloadImage(canvas: HTMLCanvasElement) {
		const link = document.createElement('a');
		link.href = canvas.toDataURL();
		link.download = 'qr.png';
		link.click();
	}

	// === Compartir la imagen (mobile) ===
	async ShareImage(canvas: HTMLCanvasElement) {
		let base64 = canvas.toDataURL();
		let path = 'qr.png';

		const loading = await this.loadingController.create({
			spinner: 'crescent',
		});
		await loading.present();

		await Filesystem.writeFile({
			path: path,
			data: base64,
			directory: Directory.Cache,
		}).then(async (res) => {
				let uri = res.uri;

				await Share.share({
					url: uri,
				});

				await Filesystem.deleteFile({
					path,
					directory: Directory.Cache,
				});
			}).finally(() => {
				loading.dismiss();
			});
	}
}
