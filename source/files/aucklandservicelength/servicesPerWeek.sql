select
#routeDistances.route_short_name,
trips.route_id,
(sum(cast(monday as int) + cast(tuesday as int) + cast(wednesday as int) + cast(thursday as int) + cast(friday as int) + cast(saturday as int) + cast(sunday as int)) 
+ (select count(*) from calendar_dates where calendar_dates.service_id = calendar.service_id and calendar_dates.exception_type = 1 and calendar_dates.date >= '2018-11-05' and calendar_dates.date <= '2018-11-11')
- (select count(*) from calendar_dates where calendar_dates.service_id = calendar.service_id and calendar_dates.exception_type = 2 and calendar_dates.date >= '2018-11-05' and calendar_dates.date <= '2018-11-11')) as servicesperweek
into #servicesPerWeek
from calendar
left join trips
on trips.service_id = calendar.service_id
left join #routeDistances
on #routeDistances.route_id = trips.route_id
group by
calendar.service_id,
#routeDistances.route_short_name,
trips.route_id
order by servicesperweek desc

select
route_short_name,
sum(servicesperweek) as servicesperweek
from #servicesPerWeek
group by route_short_name
order by servicesperweek desc