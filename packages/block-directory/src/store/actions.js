/**
 * WordPress dependencies
 */
import { apiFetch } from '@wordpress/data-controls';
import { getBlockTypes } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import { loadAssets } from './controls';

/**
 * Returns an action object used in signalling that the downloadable blocks
 * have been requested and is loading.
 *
 * @param {string} filterValue Search string.
 *
 * @return {Object} Action object.
 */
export function fetchDownloadableBlocks( filterValue ) {
	return { type: 'FETCH_DOWNLOADABLE_BLOCKS', filterValue };
}

/**
 * Returns an action object used in signalling that the downloadable blocks
 * have been updated.
 *
 * @param {Array}  downloadableBlocks Downloadable blocks.
 * @param {string} filterValue        Search string.
 *
 * @return {Object} Action object.
 */
export function receiveDownloadableBlocks( downloadableBlocks, filterValue ) {
	return {
		type: 'RECEIVE_DOWNLOADABLE_BLOCKS',
		downloadableBlocks,
		filterValue,
	};
}

/**
 * Returns an action object used in signalling that the user does not have
 * permission to install blocks.
 *
 * @param {boolean} hasPermission User has permission to install blocks.
 *
 * @return {Object} Action object.
 */
export function setInstallBlocksPermission( hasPermission ) {
	return { type: 'SET_INSTALL_BLOCKS_PERMISSION', hasPermission };
}

/**
 * Action triggered to download block assets.
 *
 * @param {Object}   item      The selected block item
 * @param {Function} onSuccess The callback function when the action has
 *                             succeeded.
 * @param {Function} onError   The callback function when the action has failed.
 */
export function* downloadBlock( item, onSuccess, onError ) {
	try {
		if ( ! item.assets.length ) {
			throw new Error( 'Block has no assets' );
		}

		yield loadAssets( item.assets );
		const registeredBlocks = getBlockTypes();
		if ( registeredBlocks.length ) {
			onSuccess( item );
		} else {
			throw new Error( 'Unable to get block types' );
		}
	} catch ( error ) {
		yield onError( error );
	}
}

/**
 * Action triggered to install a block plugin.
 *
 * @param {string}   item      The block item returned by search.
 * @param {Function} onSuccess The callback function when the action has
 *                             succeeded.
 * @param {Function} onError   The callback function when the action has failed.
 */
export function* installBlock( { id, name }, onSuccess, onError ) {
	try {
		const response = yield apiFetch( {
			path: '__experimental/block-directory/install',
			data: {
				slug: id,
			},
			method: 'POST',
		} );
		if ( response.success === false ) {
			throw new Error( response.errorMessage );
		}
		yield addInstalledBlockType( { id, name } );
		onSuccess();
	} catch ( error ) {
		onError( error );
	}
}

/**
 * Returns an action object used to add a newly installed block type.
 *
 * @param {Object} item The block item with the block id and name.
 *
 * @return {Object} Action object.
 */
export function addInstalledBlockType( item ) {
	return {
		type: 'ADD_INSTALLED_BLOCK_TYPE',
		item,
	};
}

/**
 * Returns an action object used to indicate install in progress
 *
 * @param {boolean} isInstalling
 *
 * @return {Object} Action object.
 */
export function setIsInstalling( isInstalling ) {
	return {
		type: 'SET_INSTALLING_BLOCK',
		isInstalling,
	};
}

/**
 * Sets an error notice string to be displayed to the user
 *
 * @param {string} blockId  The ID of the block plugin. eg: my-block
 * @param {string} noticeId The ID of the message used to determine which
 *                          notice to show.
 *
 * @return {Object} Action object.
 */
export function setErrorNotice( blockId, noticeId ) {
	return {
		type: 'SET_ERROR_NOTICE_ID',
		blockId,
		noticeId,
	};
}

/**
 * Sets the error noticeId to empty for specific block
 *
 * @param {string} blockId The ID of the block plugin. eg: my-block
 *
 * @return {Object} Action object.
 */
export function clearErrorNotice( blockId ) {
	return {
		type: 'SET_ERROR_NOTICE_ID',
		blockId,
		noticeId: '',
	};
}
