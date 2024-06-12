class WebsiteHitTracker {
    constructor() {
        this.customerDevices = new Map(); 
        this.websiteVisits = new Map(); 
    }

    visitWebsite(customerId, deviceId, websiteId) {
        if (!this.customerDevices.has(customerId)) {
            this.customerDevices.set(customerId, new Set());
        }
        this.customerDevices.get(customerId).add(deviceId);

        if (!this.websiteVisits.has(websiteId)) {
            this.websiteVisits.set(websiteId, new Map());
        }
        if (!this.websiteVisits.get(websiteId).has(customerId)) {
            this.websiteVisits.get(websiteId).set(customerId, new Set());
        }
        this.websiteVisits.get(websiteId).get(customerId).add(deviceId);
    }

    getWebsiteVisitCountForCustomer(customerId, websiteId) {
        if (this.websiteVisits.has(websiteId) && this.websiteVisits.get(websiteId).has(customerId)) {
            return this.websiteVisits.get(websiteId).get(customerId).size;
        }
        return 0;
    }

    getOverallWebsiteHitCount(websiteId) {
        if (this.websiteVisits.has(websiteId)) {
            
            return this.websiteVisits.get(websiteId).size;
        }
        return 0;
    }
}

module.exports = new WebsiteHitTracker();