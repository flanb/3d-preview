import addMaterialDebug from './addMaterialDebug.js';
import { FolderApi } from '@tweakpane/core';
import { Object3D } from 'three';
import * as THREE from 'three';

const objectParams = {
	visible: { type: 'boolean' },
	castShadow: { type: 'boolean' },
	receiveShadow: { type: 'boolean' },
	intensity: { type: 'number', min: 0, max: 10, step: 0.01 },
	color: { type: 'color', color: { type: 'float' } },
	groundColor: { type: 'color', color: { type: 'float' } },
	distance: { type: 'number', min: 0, max: 100, step: 0.01 },
	decay: { type: 'number', min: 0, max: 10, step: 0.01 },
	angle: { type: 'number', min: 0, max: Math.PI / 2, step: 0.01 },
	penumbra: { type: 'number', min: 0, max: 1, step: 0.01 },
};

/**
 * Adds debugging functionality to a given 3D object within a folder interface.
 * @param {FolderApi} folder - Tweakpane folder
 * @param {Object3D} object - 3D mesh
 * @returns {FolderApi} - Tweakpane folder
 */
export default function addObjectDebug(folder, object) {
	const meshKeys = Object.keys(objectParams);

	meshKeys.forEach((key) => {
		const keyValue = object[key];
		const meshOption = objectParams[key];
		if (keyValue !== undefined) {
			folder
				.addBinding(object, key, {
					...meshOption,
					label: key,
				})
				.on('change', () => {
					object.helper?.update();
				});
		}
	});

	// display helper
	const helperName = object.constructor.name + 'Helper';
	if (helperName in THREE) {
		const helperObject = new THREE[helperName](object);
		helperObject.devObject = true;
		folder
			.addBinding({ helperVisible: false }, 'helperVisible', {
				label: 'helper',
			})
			.on('change', ({ value }) => {
				if (object.helper) {
					object.helper.visible = value;
				} else {
					object.helper = helperObject;
					object.helper.visible = value;
					object.parent.add(object.helper);
				}
			});
	}

	// const controls = new useTransformControls(object, debugFolder);
	// if (object.target) {
		// const targetControls = new useTransformControls(object.target, debugFolder, 'transform control target');
	// }

	object.traverse((child) => {
		if (child.material) {
			addMaterialDebug(folder, child.material, {
				title: child.material.name || `${child.name}Material(${child.material.constructor.name.replace('Material', '')})`,
			});
		}
	});

	return folder;
}
