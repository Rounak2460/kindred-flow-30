
-- Auto-update avg_rating and review_count on courses when course_reviews change
CREATE OR REPLACE FUNCTION public.update_course_avg_rating()
RETURNS TRIGGER AS $$
DECLARE target_id uuid;
BEGIN
  target_id := COALESCE(NEW.course_id, OLD.course_id);
  UPDATE courses SET
    avg_rating = (SELECT COALESCE(AVG(overall_rating), 0) FROM course_reviews WHERE course_id = target_id),
    review_count = (SELECT COUNT(*) FROM course_reviews WHERE course_id = target_id)
  WHERE id = target_id;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';

CREATE TRIGGER update_course_stats_trigger
AFTER INSERT OR UPDATE OR DELETE ON course_reviews
FOR EACH ROW EXECUTE FUNCTION public.update_course_avg_rating();

-- Auto-update avg_rating and review_count on exchange_colleges when exchange_reviews change
CREATE OR REPLACE FUNCTION public.update_exchange_avg_rating()
RETURNS TRIGGER AS $$
DECLARE target_id uuid;
BEGIN
  target_id := COALESCE(NEW.college_id, OLD.college_id);
  UPDATE exchange_colleges SET
    avg_rating = (SELECT COALESCE(AVG((academics_rating + living_costs_rating + social_life_rating + travel_rating) / 4.0), 0) FROM exchange_reviews WHERE college_id = target_id),
    review_count = (SELECT COUNT(*) FROM exchange_reviews WHERE college_id = target_id)
  WHERE id = target_id;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';

CREATE TRIGGER update_exchange_stats_trigger
AFTER INSERT OR UPDATE OR DELETE ON exchange_reviews
FOR EACH ROW EXECUTE FUNCTION public.update_exchange_avg_rating();

-- Auto-update avg_rating and review_count on internship_companies when internship_reviews change
CREATE OR REPLACE FUNCTION public.update_internship_avg_rating()
RETURNS TRIGGER AS $$
DECLARE target_id uuid;
BEGIN
  target_id := COALESCE(NEW.company_id, OLD.company_id);
  UPDATE internship_companies SET
    avg_rating = (SELECT COALESCE(AVG((work_culture_rating + learning_rating + mentorship_rating + ppo_rating) / 4.0), 0) FROM internship_reviews WHERE company_id = target_id),
    review_count = (SELECT COUNT(*) FROM internship_reviews WHERE company_id = target_id)
  WHERE id = target_id;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';

CREATE TRIGGER update_internship_stats_trigger
AFTER INSERT OR UPDATE OR DELETE ON internship_reviews
FOR EACH ROW EXECUTE FUNCTION public.update_internship_avg_rating();
