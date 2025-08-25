import hashlib
import json
from datetime import datetime

def calculate_merkle_root(tx_hashes):
    if not tx_hashes:
        return hashlib.sha256(b'').hexdigest
    
    current_level = tx_hashes
    while len(current_level) > 1:
        next_level = []
        for i in range(0, len(current_level), 2):
            left = current_level[i]
            right = current_level[i+1] if i+1 < len(current_level) else left
            combined = (left + right).encode('utf-8')
            next_level.append(hashlib.sha256(combined).hexdigest())
        current_level = next_level
        
    return current_level[0]

def mine_block(block, difficulty=4):
    assert difficulty >= 1
    target = '0' * difficulty
    while True:
        block_content = f"{block.index}{block.timestamp}{block.previous_hash}{block.merkle_root}{block.nonce}"
        block_hash = hashlib.sha256(block_content.encode('utf-8')).hexdigest()
        
        if block_hash.startswith(target):
            block.current_hash = block_hash
            block.finalized = True
            block.save()
            return block
        block.nonce += 1
    