package com.sadi.pinklifeline.models.dtos;

import lombok.*;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class WebPushMessage {
		
		public String title;
		public String body;
		public List<Action> actions;
		public Map<String, String> data;

		public static class Action{
			public String action;
			public String title;
			public String type;

			public Action(String action, String title) {
				this.action = action;
				this.title = title;
				this.type = "button";
			}

			public Action(){}
		}
	}
