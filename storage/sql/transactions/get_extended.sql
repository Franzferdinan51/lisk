/*
 * Copyright © 2018 Lisk Foundation
 *
 * See the LICENSE file at the top-level directory of this distribution
 * for licensing information.
 *
 * Unless otherwise agreed in a custom licensing agreement with the Lisk Foundation,
 * no part of this software, including this file, may be copied, modified,
 * propagated, or distributed except according to the terms contained in the
 * LICENSE file.
 *
 * Removal or modification of this copyright notice is prohibited.
 */

SELECT
	"t_id" as "id",
	"b_id" as "blockId",
	"b_height" as "blockHeight",
	"t_type" as "type",
	"t_timestamp" as "timestamp",
	"t_senderId" as "senderId",
	"t_recipientId" as "recipientId",
	"t_amount" as "amount",
	"t_fee" as "fee",
	"t_signature" as "signature",
	"t_signSignature" as "signSignature",
	"t_signatures" as "signatures",
	"t_senderPublicKey" as "senderPublicKey",
	"t_requesterPublicKey" as "requesterPublicKey",
	(( SELECT (blocks.height + 1)
           FROM blocks
          ORDER BY blocks.height DESC
         LIMIT 1) - b.height) AS confirmations,
 	"tf_data" as "asset.data",
 	"s_publicKey" as "asset.signature.publicKey",
 	"d_username" as "asset.delegate.username",
 	"v_votes" as "asset.votes",
 	"m_min" as "asset.multisignature.min",
 	"m_lifetime" as "asset.multisignature.lifetime",
 	"m_keysgroup" as "asset.multisignature.keysgroup",
 	"dapp_type" as "asset.dapp.type",
 	"dapp_name" as "asset.dapp.name",
 	"dapp_description" as "asset.dapp.description",
 	"dapp_tags" as "asset.dapp.tags",
 	"dapp_link" as "asset.dapp.link",
 	"dapp_icon" as "asset.dapp.icon",
 	"dapp_category" as "asset.dapp.category",
 	"in_dappId" as "asset.inTransfer.dappId",
 	"ot_dappId" as "asset.outTransfer.dappId",
 	"ot_outTransactionId" as "asset.outTransfer.transactionId"
FROM
	(full_blocks_list fbl
	LEFT JOIN blocks b ON (((fbl."b_id")::text = (b.id)::text)))

${parsedFilters:raw}

${parsedSort:raw}

LIMIT ${limit} OFFSET ${offset}

