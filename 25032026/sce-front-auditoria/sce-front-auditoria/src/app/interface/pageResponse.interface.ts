import { PageableResponse } from "./pageableResponse.interface";

export interface PageResponse<T> {
    content: T[];
    pageable: PageableResponse;
    last: boolean;
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    first: boolean;
    numberOfElements: number;
    empty: boolean;
}
