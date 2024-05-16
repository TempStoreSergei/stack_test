import {defineStore} from 'pinia';
import axios from 'axios';
interface Organization {
    name: string;
    number: string;
    boss: string;
    id: string;
}


interface QueryParams {
    page?: number;
    results?: number;
}

interface PaginationParams {
    page: number;
    pageSize: number;
}
export const useUsersModel = defineStore('organization', {
    state: () => ({
        organizations: [] as Organization[],
        loading: false,
        current: 1,
        pageSize: 10,
        SearchResults: [],
    }),

    actions: {
        async queryData(params: QueryParams) {
            this.loading = true;
            try {
                const response = await axios.get('https://randomuser.me/api?noinfo', { params });
                this.organizations = response.data?.results;
            } catch (error) {
                console.error('Error querying data:', error);
            } finally {
                this.loading = false;
            }
        },

        async addOrganization(organization: Organization) {
            this.loading = true;
            try {
                this.organizations.push(organization);
            } catch (error) {
                console.error('Error adding organization:', error);
            } finally {
                this.loading = false;
            }

        },

        async deleteOrganization(id: string) {
            this.loading = true;
            try {
                this.organizations = this.organizations.filter(org => org.login.uuid !== id);
            } catch (error) {
                console.error('Error deleting organization:', error);
            } finally {
                this.loading = false;
            }
        },

        async searchOrganization(searchValue: string) {
            try {
                this.loading = true;
                if (searchValue.trim() !== '') {
                    this.SearchResults = this.organizations.filter((org) => {
                        const name = org.name.first + ' ' + org.name.last
                        return name.toLowerCase().includes(searchValue.toLowerCase())
                    });
                } else {
                    this.SearchResults = [];
                }
            } catch (error) {
                console.error('Error searching organizations:', error);
            } finally {
                this.loading = false;
            }
        },


        changePagination(pageParams: PaginationParams) {
            this.loading = true;
            try {
                this.current = pageParams.page;
                this.pageSize = pageParams.pageSize;
            } catch (error) {
                console.error('Error change pagination params:', error);
            } finally {
                this.loading = false;
            }
        },
    },
});
