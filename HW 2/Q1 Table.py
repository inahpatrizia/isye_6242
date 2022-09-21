import sqlite3
from sqlite3 import Error
import pandas as pd
pd.set_option('display.max_columns',10)

connection = sqlite3.connect("HW2_Q1")
connection.text_factory = str

data = pd.read_csv("Q1/popular_board_game.csv")
data.to_sql("popular_board_game", connection, if_exists = "replace")

sql = """

select  a.category,
        a.group_category,
        a.total_game_count,
        b.name,
        a.avg_rating,
        a.avg_playtime
from (
        select  category,
                case when min_players > 1 then "Not Support Solo" else "Support Solo" end as group_category,
                count(distinct name) as total_game_count,
                round(avg(avg_rating),2) as avg_rating,
                round(avg(playtime_num),2) as avg_playtime
        from popular_board_game
        group by    1,2
        ) a

left join (
            select *
            from (
                    select  category,
                            case when min_players > 1 then "Not Support Solo" else "Support Solo" end as group_category,
                            name, 
                            rank() over (partition by category, case when min_players > 1 then "Not Support Solo" else "Support Solo" end order by num_ratings desc) as rn
                    from popular_board_game 
                    ) where rn = 1

        ) b on a.category = b.category and a.group_category = b.group_category
order by 1,2
"""

results = pd.read_sql_query(sql,connection)
print(results)
results.to_csv("Q1/popular_board_game_results.csv")
