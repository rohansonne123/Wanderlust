This is the website Link i have made for **PROBLEM STATEMENT 3**-Implement website hit counter System 
https://wanderlust-ihwj.onrender.com/listing

>##Step By step guide how to use:
> > >1)As you can click on website link you can go into the home page <br>
> >2)here you can see all the hotels<br>
> > >3)ON home page you can also see 3 button where it gives information about total number of visitors,Registered users and unique user(which calculate unique user from different different devices)<br>
4)after that as you click on one of the listing(hotel) you can see the detail about that particular hotel or villa like who is owner,info about that,location and rent
you can also add review to that particular hotel,villa and you can get exact location on map by signinor login.<br>
5)you can also edit or delete your listing by clicking on edit and delete button but condition is that to edit or delete you must be owner of that particular listing.<br>
6)for adding your hotel or listing you can click on add new listing as you dont signin uo to now then you can first signin or login then you can add listing or hotel in our website.<br>

Tech-Stack
fornt-end:HTML5,CSS3,JavaScript,Bootstrap<br>
Backend:ExpressJS,NodeJs<br>
DataBase:-MongoDB<br>
API's:-Google Map,REST API<br>

Hosting:-
DataBase Storage:-MongoDB Atlas Database free tier<br>
website host:-Render<br>


**HitTracer working**:-(unique button in website)  path:-/utils/HitTrackers.js (utils folder found that file)<br>
                      The logic can be used in /Router/listingRouter.js (in get request)<br>
                      

**VisitTracker Class:**<br>

**Constructor**: Initializes a Map this.visits to store visits. Each websiteId maps to another Map where each customerId maps to a Set of deviceIds.<br>
visitWebsite(customerId, deviceId, websiteId):
>>Adds a new entry for websiteId if it doesn't exist.<br>
>>Adds a new entry for customerId under the specific websiteId if it doesn't exist.<br>
>>Adds the deviceId to the Set associated with the customerId.<br>
**getWebsiteVisitCountForCustomer(customerId, websiteId)**: <br>
>>Returns 0 if websiteId doesn't exist.<br>
>>Checks if customerId exists for the websiteId. Returns 1 if it does, 0 otherwise.<br>
**getOverallWebsiteHitCount(websiteId):**
Returns the number of unique customers who have visited the websiteId.
Express Route:

**Parameters**: Extracts customerId, deviceId, and websiteId from query parameters.
**Visit Tracking**: Calls visitWebsite to track the visit.
**Logging**: Logs the overall visit count and the visit count for the specific customer.
**Database Query**: Fetches all listings from the database and renders them using EJS

**Edge-Cases:-**
1)Invalid IDs:
2)Memory Usage:
3)Concurrency:
4)Duplicate Devices
5)Session Hijacking



