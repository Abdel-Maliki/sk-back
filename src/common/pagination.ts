/**
 * @author abdel-maliki
 * Date : 21/10/2020
 */

export interface Pagination {
    page: number;
    size: number;
    totalElements: number;
    sort?: string;
    direction?: number;
    globalFilter?: string;
    filters?: any;
}
