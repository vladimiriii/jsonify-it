SELECT SUM(FT.final_value) AS Total
, FT.category
FROM (
SELECT DOC.DOC_ID
, MAX(Vals.amount) AS final_amount -- In case different values are present
, Cats.category
FROM (
	SELECT D.id AS DOC_ID
	FROM Document D
	WHERE D.verified IS TRUE
) DOC
INNER JOIN DocumentSetFormEntry DFSE
ON DOC.DOC_id = DFSE.document_id
INNER JOIN (
	SELECT DSFI1.value::NUMERIC as amount
	,DSFI1.entry_id
	FROM DocumentSetFieldEntry DSFI1
	WHERE DSFI1.field_id = 117
	AND DSFI1.verified IS TRUE
) Vals
ON DFSE.id = Vals.entry_id
INNER JOIN (
	SELECT DSFI2.value AS category
	,DSFI1.entry_id
	FROM DocumentSetFieldEntry DSFI2
	WHERE DSFI2.field_id = 90
	AND DSFI2.verified IS TRUE
	LIMIT 1
) Cats
ON DFSE.id = cats.entry_id
GROUP BY DOC.DOC_ID
, Cats.category
) FT
GROUP BY FT.category
ORDER BY SUM(FT.final_value) DESC
LIMIT 4
