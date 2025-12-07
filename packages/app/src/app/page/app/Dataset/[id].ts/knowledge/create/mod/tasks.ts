/**
 * 1. Get content
 *  1.1 Upload file
 *  1.2 Composing text
 *  1.3 Sync from Cloud docs.
 *      1.3.1 Pick files to sync
 * 2. Chunking
 *  2.1 Upload file
 *      2.1.1 Create chunk tasks
 *  2.2 Composing text
 *      2.2.1 Create chunk tasks
 *  2.3 Sync from Cloud docs.
 *      2.3.1 Create sync and chunk tasks
 * 3. Indexing
 *  3.1 Upload file
 *  3.2 Composing text
 *  3.3 Sync from Cloud docs.
 *      1.3.1 Pick files to sync
 */
function fetchContentTask(taskParams: {
    type: string;
    params: any;
}): Promise<string> {
    ;
}

function chunkingTask(content: string): Promise<string[]> {

}


