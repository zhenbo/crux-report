select pv.path, count(*) as TOTAL_PAGE_VIEWS, CONCAT('https://', pv.domain, pv.path) AS URL from prod_shared_heap.heap.pageviews pv
where date(time) > '2023-03-20' and pv.path like '/o/%' and pv.domain = 'www.eventbrite.com'
group by (pv.domain,pv.path) order by TOTAL_PAGE_VIEWS desc limit 50;

select pv.path, count(*) as TOTAL_PAGE_VIEWS, CONCAT('https://', pv.domain, pv.path) AS URL from prod_shared_heap.heap.pageviews pv
where date(time) > '2023-03-20' and pv.path like '/cc/%' and pv.domain = 'www.eventbrite.com'
group by (pv.domain,pv.path) order by TOTAL_PAGE_VIEWS desc limit 50;

select pv.path, count(*) as TOTAL_PAGE_VIEWS, CONCAT('https://', pv.domain, pv.path) AS URL from prod_shared_heap.heap.pageviews pv
where date(time) > '2023-03-20' and pv.path like '/d/%' and pv.domain = 'www.eventbrite.com'
group by (pv.domain,pv.path) order by TOTAL_PAGE_VIEWS desc limit 50;

select pv.path, count(*) as TOTAL_PAGE_VIEWS, CONCAT('https://', pv.domain, pv.path) AS URL from prod_shared_heap.heap.pageviews pv
where date(time) > '2023-03-20' and pv.path like '/b/%' and pv.domain = 'www.eventbrite.com'
group by (pv.domain,pv.path) order by TOTAL_PAGE_VIEWS desc limit 50;

select pv.path, count(*) as TOTAL_PAGE_VIEWS, CONCAT('https://', pv.domain, pv.path) AS URL from prod_shared_heap.heap.pageviews pv
where date(time) > '2023-03-20' and pv.path like '/e/%' and pv.domain = 'www.eventbrite.com'
group by (pv.domain,pv.path) order by TOTAL_PAGE_VIEWS desc limit 50;

select pv.path, count(*) as TOTAL_PAGE_VIEWS, CONCAT('https://', pv.domain, pv.path) AS URL from prod_shared_heap.heap.pageviews pv
where date(time) > '2023-03-20' and pv.path like '/c/%' and pv.domain = 'www.eventbrite.com'
group by (pv.domain,pv.path) order by TOTAL_PAGE_VIEWS desc limit 50;

select pv.path, count(*) as TOTAL_PAGE_VIEWS, CONCAT('https://', pv.domain, pv.path) AS URL from prod_shared_heap.heap.pageviews pv
where date(time) > '2023-03-20' and pv.path like '/l/%' and pv.domain = 'www.eventbrite.com'
group by (pv.domain,pv.path) order by TOTAL_PAGE_VIEWS desc limit 50;
