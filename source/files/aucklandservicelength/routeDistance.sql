SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION routeDistance 
(
	-- Add the parameters for the function here
	@trip_id varchar(100)
)
RETURNS int
AS
BEGIN
	-- Declare the return variable here
	DECLARE @result int
	DECLARE @BuildString NVARCHAR(MAX)

	SELECT @BuildString = COALESCE(@BuildString + ',', '') + CAST([shape_pt_lon] AS NVARCHAR(50)) + ' ' + CAST([shape_pt_lat] AS NVARCHAR(50))
	from trips
	left join shapes on shapes.shape_id = trips.shape_id
	where trips.trip_id = @trip_id
	order by shape_pt_sequence asc

	SET @BuildString = 'LINESTRING(' + @BuildString + ')';   
	DECLARE @LineFromPoints geography = geography::STLineFromText(@BuildString, 4326);
	SELECT @result = @LineFromPoints.STLength();

	RETURN @result

END
GO

select routes.route_id, routes.route_short_name, routes.route_long_name, dbo.routeDistance(trips.trip_id) as meters 
into #routeDistances
from routes 
left join trips on trips.trip_id = (
	select top 1 trips.trip_id
	from trips
	where trips.route_id = routes.route_id
)
order by meters desc

select * from #routeDistances order by meters desc
