export function middleware(callback: (request: Request) => any): void;
export namespace middleware {
    /**
     *
     * @param {Request} request
     * @returns {Promise<any>}
     */
    function current(request: Request): Promise<any>;
}
export function action(path: string, data: any, isForm: bool): Promise<any>;
