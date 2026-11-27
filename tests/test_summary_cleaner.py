import pytest
from backend.services.search_service import clean_article_summary, is_similar_to_title, is_metadata_or_caption


def test_duplicated_headlines():
    title = "Hyundai and Boston Dynamics unveil humanoid robot Atlas at CES | AP News"
    raw_highlight = """Hyundai and Boston Dynamics unveil humanoid robot Atlas at CES
Hyundai and Boston Dynamics unveil humanoid robot Atlas at CES
Hyundai-owned Boston Dynamics publicly demonstrated its humanoid robot Atlas for the first time Monday at the CES tech showcase, ratcheting up a competition with Tesla and other rivals."""

    cleaned = clean_article_summary(raw_highlight, title)
    assert not cleaned.startswith("Hyundai and Boston Dynamics unveil humanoid robot Atlas at CES")
    assert cleaned.startswith("Hyundai-owned Boston Dynamics publicly demonstrated its humanoid robot Atlas")
    assert "ratcheting up a competition with Tesla" in cleaned


def test_markdown_images():
    title = "Autonomous Robot Delivery Fleet Launched"
    raw_highlight = """Autonomous Robot Delivery Fleet Launched
![Robot driving on sidewalk](https://images.example.com/robot.jpg)
Delivery robots have officially started commercial operations in three major metropolitan areas today, navigating city sidewalks safely."""

    cleaned = clean_article_summary(raw_highlight, title)
    assert "![" not in cleaned
    assert "https://images.example.com" not in cleaned
    assert cleaned.startswith("Delivery robots have officially started commercial operations")


def test_bylines():
    title = "Dealership Sells First Consumer Robot"
    raw_highlight = """Dealership Sells First Consumer Robot
By Ben Shimkus
Written by Staff Reporter
Automotive dealerships across the country have begun offering bipedal robots alongside traditional electric vehicles."""

    cleaned = clean_article_summary(raw_highlight, title)
    assert "By Ben Shimkus" not in cleaned
    assert "Written by Staff Reporter" not in cleaned
    assert cleaned.startswith("Automotive dealerships across the country")


def test_timestamps():
    title = "Breakthrough in Solid-State Battery Tech"
    raw_highlight = """2026-08-26T17:50:47.997Z
Researchers at the national laboratory have synthesized a new solid-state electrolyte with record-high ionic conductivity at room temperature."""

    cleaned = clean_article_summary(raw_highlight, title)
    assert "2026-08-26" not in cleaned
    assert cleaned.startswith("Researchers at the national laboratory have synthesized")


def test_crawler_separators():
    title = "Next Generation Space Telescope Discovers Exoplanet"
    raw_highlight = """Astronomers analyzing deep infrared data have detected an Earth-sized exoplanet in the habitable zone.
 ... 
The discovery was confirmed using spectroscopic radial velocity measurements."""

    cleaned = clean_article_summary(raw_highlight, title)
    assert " ... " not in cleaned
    assert "Astronomers analyzing deep infrared data" in cleaned


def test_empty_content():
    assert clean_article_summary("") == ""
    assert clean_article_summary("   \n\t  ") == ""
    assert clean_article_summary(None) == ""
    assert clean_article_summary("...") == ""
    assert clean_article_summary("... \n\n ...") == ""


def test_unrelated_fragments():
    title = "Boston Dynamics Atlas at CES"
    raw_highlight = """Hyundai-owned Boston Dynamics publicly demonstrated its humanoid robot Atlas for the first time Monday at the CES tech showcase, ratcheting up a competition with Tesla and other rivals to build robots that look like people and do things that people do. Zachary Jackowski introduced the robot to an enthusiastic audience in Las Vegas.
 ... 
 The same Georgia plant where Hyundai plans to test out Atlas was the site of a federal immigration raid last year that led to the arrests of hundreds of workers."""

    cleaned = clean_article_summary(raw_highlight, title, max_chars=350)
    # The clean summary should focus on the primary lead narrative and not append the distant unrelated raid fragment
    assert "publicly demonstrated its humanoid robot Atlas" in cleaned
    assert "federal immigration raid" not in cleaned


def test_actual_hyundai_ap_news():
    title = "Hyundai and Boston Dynamics unveil humanoid robot Atlas at CES | AP News"
    raw_highlight = """Hyundai and Boston Dynamics unveil humanoid robot Atlas at CES
Hyundai and Boston Dynamics unveil humanoid robot Atlas at CES
Hyundai-owned Boston Dynamics publicly demonstrated its humanoid robot Atlas for the first time Monday at the CES tech showcase, ratcheting up a competition with Tesla and other rivals to build robots that look like people and do things that people do.
“For the first time ever in public, please welcome Atlas to the stage,” said Boston Dynamics’ Zachary Jackowski as a life-sized robot with two arms and two legs picked itself up from the floor at a Las Vegas hotel ballroom.
It then fluidly walked around the stage for several minutes, sometimes waving to the crowd and swiveling its head like an owl.
 ... 
 The same Georgia plant where Hyundai plans to test out Atlas was the site of a federal immigration raid last year."""

    cleaned = clean_article_summary(raw_highlight, title)
    assert not cleaned.startswith("Hyundai and Boston Dynamics unveil humanoid robot Atlas")
    assert cleaned.startswith("Hyundai-owned Boston Dynamics publicly demonstrated its humanoid robot Atlas")
    assert len(cleaned) <= 350
    assert cleaned.endswith(".")


def test_actual_hyundai_business_insider():
    title = "Hyundai CEO Says Your Car Dealership Could Sell You a Humanoid Robot - Business Insider"
    raw_highlight = """Hyundai CEO says your local car dealership could sell you a humanoid robot

By Ben Shimkus

![A Boston Dynamics robot on the pitch during the World Cup match between Brazil and Norway.](https://i.insider.com/6a8eea733f7df8787cff383c?width=700)

A Boston Dynamics Atlas robot is on the pitch during the World Cup match between Brazil and Norway. Hyundai's CEO says he hopes homeowners will pick one up at a dealership.Rich Graessle/Icon Sportswire via Getty Images

2026-08-26T17:50:47.997Z

Your local Hyundai dealership could someday start selling humanoid and dog-like robots.

"We have existing potential distribution for selling robots through our dealer partners," José Muñoz, Hyundai's CEO, said during the company's investor day. He added that Hyundai Capital, which already finances cars, is exploring whether it could do the same for robots."""

    cleaned = clean_article_summary(raw_highlight, title)
    assert not cleaned.startswith("Hyundai CEO says your local car dealership")
    assert "By Ben Shimkus" not in cleaned
    assert "Rich Graessle" not in cleaned
    assert "![A Boston Dynamics" not in cleaned
    assert cleaned.startswith("Your local Hyundai dealership could someday start selling")
    assert len(cleaned) <= 350


def test_raw_json_error_rejection():
    raw_json_error = '{"error": {"code": 429, "message": "Rate limit exceeded"}}'
    assert clean_article_summary(raw_json_error, "Research Title") == ""

    raw_detail_error = '{"detail": "Octen search API unauthorized"}'
    assert clean_article_summary(raw_detail_error, "Research Title") == ""
